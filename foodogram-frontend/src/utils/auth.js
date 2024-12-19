import axios from 'axios';

export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('No token found');
    }

    const response = await axios.post('http://localhost:5000/api/refresh-token', {
      token: currentToken
    });

    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw error;
  }
};