import { createRouter, createWebHistory } from 'vue-router'
import GetBookCountView from '../views/GetBookCountView.vue'
import WeatherView from '../views/WeatherView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/getbookcount' },
    { path: '/getbookcount', name: 'getbookcount', component: GetBookCountView },
    { path: '/weather', name: 'weather', component: WeatherView },
  ],
})