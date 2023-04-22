const bcrypt = require('bcrypt');
const infoModel = require('../models/infoModel');
const { generateToken } = require('../middleware/auth');
const status = require('../validations/status');
const message = require('../validations/message');
const { logger } = require('../winston/logger');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

function adminService() { }

adminService.prototype.createAdmin = async function (name, email, password, role) {
  try {
    const existingUser = await infoModel.query().findOne({ email });
    if (existingUser) {
      return { error: message.User_Already_Exists }
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const admin = await infoModel.query().insert({ name, email, password: hashedPassword, role });
    return { admin };

  } catch (error) {
    return { error };
  }
};
adminService.prototype.login = async function (email, password, role) {
  try {
    const admin = await infoModel.query().where({ 'email': email, 'role': role }).first();
    if (!admin) {
      return { error: message.Invalid_email }
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return { error: message.Invalid_password }
    }

    const token = generateToken(admin);
    return { token, admin };

  } catch (error) {
    return { error };
  }
};
adminService.prototype.searchUserManagement = async function (id, name, email, status, sortBy, page, limit) {
  try {
    const offset = (page - 1) * limit;
    let query = infoModel.query().whereIn('role', ['lender', 'renter']);
    let users;
    let totalItems = 0;

    if (!id && !name && !email && !status && !sortBy) {
      query.orderBy('id', 'asc');
    }
    else if (sortBy) {
      query.orderBy('id', sortBy === 'asc' ? 'asc' : 'desc');
    }
    else if (status) {
      if (status == 'active' || status === 'inactive') {
        query.where('status', status).orderBy('id', 'asc');
      }
    }
    else {
      query.where(async function () {
        if (id) {
          this.where('id', 'like', `%${id}%`);
        }
        if (name) {
          this.where('name', 'like', `%${name}%`);
        }
        if (email) {
          this.where('email', 'like', `%${email}%`);
        }
      });
    }

    totalItems = await query.resultSize();
    query.limit(limit).offset(offset);
    users = await query.select(['id', 'name', 'email', 'status']);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    return { users, totalItems, totalPages, currentPage };
  }
  catch (error) {
    return { error };
  }
};
adminService.prototype.searchItemManagement = async function (id, ownerName, sortBy, page, limit, accessToken) {
  let data = {
    id: id,
    ownerName: ownerName,
    sortBy: sortBy,
    page: page,
    limit: limit
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    method: 'GET',
    url: process.env.SHOW_ITEMS,
    headers: headers,
    params: data
  })
    .then((response) => {
      const { data: items, totalItems, totalPages, currentPage } = response.data;
      return { items, totalItems, totalPages, currentPage };

    }).catch((error) => {
      if (error.response && error.response.status === status.badRequest) {
        return error;
      } else if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      return error;
    });
};
adminService.prototype.searchOrderManagement = async function (id, renterName, lenderName, productId, productName, orderType, sortBy, page, limit, accessToken) {
  let data = {
    id: id,
    renterName: renterName,
    lenderName: lenderName,
    productId: productId,
    orderType: orderType,
    productName: productName,
    sortBy: sortBy,
    page: page,
    limit: limit
  };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    method: 'GET',
    url: process.env.SHOW_ORDERS,
    headers: headers,
    params: data
  })
    .then((response) => {
      const { data: orders, totalItems, totalPages, currentPage } = response.data;
      return { orders, totalItems, totalPages, currentPage };

    }).catch((error) => {
      if (error.response && error.response.status === status.badRequest) {
        return error;
      } else if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      return error;
    });
};
adminService.prototype.getUsersById = async function (id) {
  try {
    const users = await infoModel.query().findById(id);
    if (!users) {
      return { error: message.Not_Found };
    }
    const query = await infoModel.query()
      .select(['name', 'email', 'status'])
      .where('id', id);
    let user = await query;
    return { user };
  } catch (error) {
    console.error(error);
    return error;
  }
};
adminService.prototype.getItemsById = function (id, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    baseURL: `${process.env.SHOW_ITEMSBYID}/${id}`,
    method: 'GET',
    headers: headers
  }).then((response) => {
    return response.data.data;
  }).catch((error) => {
    if (error.response && error.response.status === status.badRequest) {
      return Promise.reject(error);
    } else if (error.code === 'ECONNREFUSED') {
      return Promise.reject(new Error(message.internalServerError));
    }
    return error;
  });
};
adminService.prototype.getOrdersById = async function (id, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    baseURL: `${process.env.SHOW_ORDERSBYID}/${id}`,
    method: 'GET',
    headers: headers
  })
    .then((response) => {
      return response.data.data;
    }).catch((error) => {
      if (error.response && error.response.status === status.badRequest) {
        return Promise.reject(error);
      } else if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      return error;
    });
};
adminService.prototype.editUsers = async function (id, userData) {
  try {
    const userExists = await infoModel.query().where({ id }).first();
    if (!userExists) {
      return { error: message.Not_Found };
    }
    let updatedUserData = userData;
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updatedUserData = {
        ...userData,
        password: hashedPassword,
      };
    }
    const updatedUser = await infoModel.query().where({ id }).update(updatedUserData).first() &&
      await infoModel.query().where({ id }).first();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL_ID,
      to: updatedUser.email,
      subject: 'User data updated',
      text: `Dear ${updatedUser.name}, your user data has been updated. Here is your updated information:\n\nName: ${updatedUser.name}\nStatus: ${updatedUser.status}\nPassword: ${userData.password}`,
      html: `<p>Dear ${updatedUser.name},</p><p>Your user data has been updated.</p><p>Here is your updated information:</p><ul><li>Name: ${updatedUser.name}</li><li>Status: ${updatedUser.status}</li><li>Password: ${userData.password || '********'}</li></ul>`,
    };
    await transporter.sendMail(mailOptions);

    return { users: updatedUser };
  } catch (error) {
    console.error(error);
    if (error.response) {
      const { status, data } = error.response;
      return { status, message: data.message, data: null };
    }
    return { error: error.message };
  }
};
adminService.prototype.editItems = async function (id, brandName, categoryName, accessToken) {
  let data = {
    brandName: brandName,
    categoryName: categoryName
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    baseURL: `${process.env.EDIT_ITEMS}/${id}`,
    method: 'PUT',
    headers: headers,
    data: data
  })
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      if (error.response && error.response.status === status.badRequest) {
        return Promise.reject(error);
      }
      return error;
    });
};
adminService.prototype.deleteOrder = async function (id, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    baseURL: `${process.env.DELETE_ORDER}/${id}`,
    headers: headers,
    method: 'DELETE'
  })
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      if (error.response && error.response.status === status.badRequest) {
        return Promise.reject(error);
      }
      return error;
    })
};
adminService.prototype.deleteProduct = async function (id, accessToken) {
  try {
    const response = await axios({
      baseURL: `${process.env.DELETE_PRODUCT}/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      method: 'DELETE'
    });
    return response.data.data;

  } catch (error) {
    if (error.response && error.response.status === status.badRequest) {
      return Promise.reject(error);
    } else if (error.code === 'ECONNREFUSED') {
      return Promise.reject(new Error(message.internalServerError));
    }
    return error;
  }
}
adminService.prototype.masterData = async function (positionA, positionB, accessToken) {
  let data = {
    positionA: positionA,
    positionB: positionB
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return await axios({
    baseURL: process.env.SHOW_MASTERDATA,
    method: 'GET',
    headers: headers,
    params: data,
  }).then((response) => {
    return response.data.data;
  })
    .catch((error) => {
      if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      if (error.response && error.response.status === status.badRequest) {
        return Promise.reject(error);
      }
      return error;
    });
};
adminService.prototype.createCategory = async function (categoryName, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken
  };
  return axios({
    baseURL: process.env.CREATE_CATEGORY,
    method: 'POST',
    headers: headers,
    data: { categoryName },
  })
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error(message.internalServerError));
      }
      if (error.response && error.response.status === status.badRequest) {
        return Promise.reject(error);
      }
      return error;
    });
};
module.exports = new adminService();
