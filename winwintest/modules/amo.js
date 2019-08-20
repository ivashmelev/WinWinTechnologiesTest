const request = require('request-promise');
const cookieParser = require('cookie-parser')

class Amo {
  constructor() {
    this.amoCookie;
  }

  async auth() {
    try {
      await request({
        method: 'POST',
        uri: 'https://shmelevivan21.amocrm.ru/private/api/auth.php',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          USER_LOGIN: 'shmelevivan21@yandex.ru',
          USER_HASH: '87825642d7f8946a32143d7a2779236617f49aa4'
        },
        json: true
      }, (err, res, body) => {
        this.amoCookie = res.headers['set-cookie'];
      })
    } catch (err) {
      throw err;
    }
  }

  async getManagers() {
    try {
      const response = await request('https://shmelevivan21.amocrm.ru/api/v2/account?with=users', {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.amoCookie
        }
      });
      const data = JSON.parse(response);
      const managers = data._embedded;
      const managersId = Object.keys(managers.users);
    } catch (err) {
      throw err;
    }
  }

  async getLeads() {
    try {
      const response = await request('https://shmelevivan21.amocrm.ru/api/v2/leads', {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.amoCookie
        }
      });
      const data = JSON.parse(response);
      const leads = data._embedded.items;
      const arrResponsible = leads.map(lead => lead.responsible_user_id);
      const responsibleUsers = {};

      for (let i = 0; i < arrResponsible.length; i++) {
        if (!responsibleUsers[arrResponsible[i]]) {
          responsibleUsers[arrResponsible[i]] = 1;
        } else {
          responsibleUsers[arrResponsible[i]] += 1;
        }
      }

      return responsibleUsers;

    } catch (err) {
      throw err;
    }
  }


}


module.exports = Amo;