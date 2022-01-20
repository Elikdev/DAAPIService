const users: any[] = [];

export const userJoin = (user: any) => {
  users.push(user);
  return user;
};

export const getCurrentUser = (id: any) => {
  return users.find((user) => user.id === id);
};
