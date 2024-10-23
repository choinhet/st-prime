import {createApp} from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import {createPinia} from "pinia";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

import './assets/main.css'
import './base.css'
import Select from "primevue/select";

const app = createApp(App);

const pinia = createPinia()

app.use(PrimeVue, { theme: 'none' });

app.component('Button', Button);
app.component('Column', Column);
app.component('DataTable', DataTable);
app.component('InputText', InputText);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Select', Select);

app.use(pinia)
app.mount('#app')
