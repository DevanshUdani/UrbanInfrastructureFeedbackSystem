import axios from '../axiosConfig';

export const listIssues = (params) => axios.get('/issues', { params }).then(r => r.data);
export const getIssue = (id) => axios.get(`/issues/${id}`).then(r => r.data);

export const createIssue = async (payload, file) => {
  if (file) {
    // If there's a file, use FormData but handle nested objects properly
    const form = new FormData();
    
    // Handle nested objects by flattening them for FormData
    const flattenObject = (obj, prefix = '') => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenObject(value, prefix + key + '.');
          } else if (Array.isArray(value)) {
            // Handle arrays by converting to JSON string
            form.append(prefix + key, JSON.stringify(value));
          } else {
            form.append(prefix + key, value);
          }
        }
      }
    };
    
    flattenObject(payload);
    form.append('photo', file);
    
    return axios.post('/issues', form).then(r => r.data);
  } else {
    // If no file, send as JSON
    return axios.post('/issues', payload).then(r => r.data);
  }
};

export const updateIssueStatus = (id, status, note) =>
  axios.patch(`/issues/${id}/status`, { status, note }).then(r => r.data);
export const addComment = (id, text) =>
  axios.post(`/issues/${id}/comments`, { body: text }).then(r => r.data);
