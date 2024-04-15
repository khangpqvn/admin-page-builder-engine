export default {
  items: [
    {
      name: 'Trang chủ',
      url: '/dashboard',
      icon: 'icon-speedometer',
      badge: {
        variant: 'info',
        text: 'NEW',
      },
      roles: ['*']
    }, {
      name: 'Quản lý trang',
      url: '/pageEditor?id=1&mode=edit',
      icon: 'icon-speedometer',
      roles: ['*']
    }, {
      name: 'Test',
      icon: 'icon-speedometer',
      roles: ['*'],
      children: [
        {
          name: 'Test Form',
          url: '/form?page=2&mode=create',
          icon: 'icon-speedometer',
          roles: ['*']
        }, {
          name: 'Test List',
          url: '/list?page=1',
          icon: 'icon-speedometer',
          roles: ['*']
        }
      ]
    }
  ]
};
