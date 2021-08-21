import Api from "./Api";

class AuthService {
  login(username, password) {
    return Api()
      .post('/api/v1/login', {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data))
        }
        return response.data;
      })
  }
  logout() {
    localStorage.removeItem('user')
  }
  register(username, password, role) {
    return Api().post('/api/v1/register', {
      username,
      password,
      role
    })
  }
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'))
  }
}

export default new AuthService()