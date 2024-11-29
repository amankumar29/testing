import Cookies from 'js-cookie';

export const removeCookies = () => {
    Cookies.remove('projectId');
    Cookies.remove('applicationId')
}


