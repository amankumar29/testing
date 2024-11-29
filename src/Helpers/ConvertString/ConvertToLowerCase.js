export const formatString = (str) => {
    if (!str) 
        return ''
    return str.toLowerCase().replace(/\s+/g, '');
  };