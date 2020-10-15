const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
  body('email').isEmail().withMessage('Введите корректный email').custom(async (value, {req}) => {
    try {
      const user = await User.findOne({email: value})
      // проверяем есть ли пользователь с таким email
      if (user) {
        return Promise.reject('Такой email уже занят')
      }
    } catch (error) {
      console.log(error)
    }
  }),
  body('name').isLength({min: 2}).withMessage('Имя должно быть минимум 2 символа'),
  body('password', 'Пароль должен быть минимум 6 символов').isLength({min: 6, max: 56}).isAlphanumeric(),
  body('confirm').custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error('Пароли должны совпадать')
    }
    return true
  })
]