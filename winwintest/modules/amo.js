const request = require('request-promise');
const cookieParser = require('cookie-parser')

class Amo {
  constructor(login, hash, portal) {
    this.login = login;
    this.hash = hash;
    this.portal = portal;
    this.amoCookie;
    this.currentTask;
  }

  async auth() {
    try {
      await request({
        method: 'POST',
        uri: `https://${this.portal}.amocrm.ru/private/api/auth.php`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          USER_LOGIN: this.login,
          USER_HASH: this.hash
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
      const response = await request(`https://${this.portal}.amocrm.ru/api/v2/account?with=users`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.amoCookie
        }
      });
      const data = JSON.parse(response);
      const managers = data._embedded;
      const managersId = Object.keys(managers.users);
      return managersId;

    } catch (err) {
      throw err;
    }
  }

  async getLeads() {
    try {
      const response = await request(`https://${this.portal}.amocrm.ru/api/v2/leads`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.amoCookie
        }
      });
      const data = JSON.parse(response);
      const leads = data._embedded.items;
      this.currentTask = leads.sort((a, b) => a.id - b.id).pop().id;
      return leads;

    } catch (err) {
      return [];
    }
  }

  async getCountTaskOnUser() {
    let leads = await this.getLeads();
    const users = {};
    let arrResponsible;

    if (leads.length === 0) {
      leads = await this.getManagers();
      arrResponsible = leads;
    } else {
      arrResponsible = leads.map(lead => lead.responsible_user_id);
      arrResponsible = arrResponsible.concat(await this.getManagers());
    }

    for (let i = 0; i < arrResponsible.length; i++) {
      if (!users[arrResponsible[i]]) {
        users[arrResponsible[i]] = 1;
      } else {
        users[arrResponsible[i]] += 1;
      }
    }

    return users;
  }

  async setManager(deal) {
    const countTask = await this.getCountTaskOnUser();
    const sorted = Object.keys(countTask).sort((a, b) => countTask[a] - countTask[b]);
    const activeManager = sorted[0];
    const req = await request(`https://${this.portal}.amocrm.ru/api/v2/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.amoCookie
      },
      body: {
        update: [{
          id: this.currentTask,
          name: deal.name,
          responsible_user_id: activeManager,
          updated_at: Date.now(),
          status_id: deal.status_id
        }]
      },
      json: true
    });
  }

}


module.exports = Amo;