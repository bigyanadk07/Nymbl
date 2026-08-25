// market/greeting/greeting.service.js

const getGreeting = () => {
  const currentHour = new Date().getHours();

  let message;

  if (currentHour >= 5 && currentHour < 12) {
    message = 'Good Morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    message = 'Good Afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    message = 'Good Evening';
  } else {
    message = 'Good Night';
  }

  return {
    message
  };
};

module.exports = {
  getGreeting
};