import api from './api';

const uploadFile = (endpoint, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadBoatImage = (file) => uploadFile('/uploads/boat-images', file);
export const uploadDocumentFile = (file) => uploadFile('/uploads/documents', file);
