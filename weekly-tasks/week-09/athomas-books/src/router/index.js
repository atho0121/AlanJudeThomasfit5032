import { createRouter, createWebHistory } from 'vue-router'
import GetBookCountView from '../views/GetBookCountView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPIView from '../views/CountBookAPIView.vue'
import GetAllBookAPIView from '../views/GetAllBookAPIView.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/getbookcount' },
    { path: '/getbookcount', name: 'getbookcount', component: GetBookCountView },
    { path: '/weather', name: 'weather', component: WeatherView },
    { path: '/CountBookAPI', name: 'CountBookAPI', component: CountBookAPIView },
    { path: '/GetAllBookAPI', name: 'GetAllBookAPI', component: GetAllBookAPIView },
  ],
})