export const ADMIN_STORAGE_KEY = 'avtoshop_admin_session';

export const CONTACT_INFO = {
  city: 'Тихорецк',
  address: 'ул. Гражданская, 95',
  primaryPhone: '+7 (909) 452-10-10',
  primaryPhoneHref: 'tel:+79094521010',
  secondaryPhone: '+7 (918) 230-97-77',
  secondaryPhoneHref: 'tel:+79182309777',
  email: 'service@avtoshop-tih.ru',
  schedule: 'Пн–Вс: 08:00–18:00'
} as const;

export const BRAND_COPY = {
  name: 'AvtoShop',
  cityLine: 'Премиальный сервисный бокс в Тихорецке',
  heroTitle: 'Сервис, где автомобиль разбирают по делу, а не по шаблону.',
  heroText:
    'Диагностика, обслуживание и ремонт без лишнего шума: фиксируем состояние, согласовываем объём работ и возвращаем автомобиль в понятные сроки.',
  heroSupporting:
    'Работаем с частными авто и семейным парком, держим прозрачный прайс и показываем результат на каждом этапе.'
} as const;

export const NAV_ITEMS = [
  { id: 'services', label: 'Услуги' },
  { id: 'advantages', label: 'Преимущества' },
  { id: 'about', label: 'О сервисе' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'contact', label: 'Контакты' }
] as const;

export const ADVANTAGES = [
  {
    metric: '10+',
    title: 'лет в ремонте и обслуживании',
    description: 'Берём в работу регулярное ТО, сложную диагностику и восстановление после скрытых неисправностей.'
  },
  {
    metric: '1 день',
    title: 'на базовые сервисные работы',
    description: 'Согласовываем сроки заранее и сразу предупреждаем, если задача требует больше времени.'
  },
  {
    metric: '0',
    title: 'навязанных позиций в заказ-наряде',
    description: 'Сначала диагностика и объяснение по фактам, потом решение по работам и бюджету.'
  }
] as const;
