import React from 'react';
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard'),
  loading: Loading,
});
const Profile = Loadable({
  loader: () => import('./views/User/Profile'),
  loading: Loading,
});
const PageEditor = Loadable({
  loader: () => import('./views/PageManager/PageEditor'),
  loading: Loading,
});
const FormViewer = Loadable({
  loader: () => import('./views/Form/FormViewer'),
  loading: Loading,
});
const ListViewer = Loadable({
  loader: () => import('./views/List/ListViewer'),
  loading: Loading,
});

// const OrderComment = Loadable({
//   loader: () => import('./views/Comment/OrderComment'),
//   loading: Loading,
// });

// const OrderDetail = Loadable({
//   loader: () => import('./views/Order/OrderDetail'),
//   loading: Loading,
// });
const TargetDetail = Loadable({
  loader: () => import('./views/TargetDetail/TargetDetail'),
  loading: Loading,
});

const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/pageEditor', name: 'Quản lý trang', component: PageEditor },
  { path: '/form', name: 'Trang', component: FormViewer },
  { path: '/list', name: 'Trang', component: ListViewer },
  { path: '/profile', name: 'Trang cá nhân', component: Profile },
  { path: '/target-detail', name: 'Target detail', component: TargetDetail },

  // { path: '/ordercomment', name: 'Comment', component: OrderComment },
  // { path: '/orderdetail', name: 'Order Detail', component: OrderDetail },

];

export default routes;
