const { Router } = require('express')
const { validationResult } = require('express-validator')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const { addCourseValidators } = require('../utils/validators')
const router = Router()

// является ли владельцем курса авторизованный пользователь
function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img')
  
    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses
    })    
  } catch (error) {
    console.log(error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
  
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
    })    
  } catch (error) {
    console.log(error)
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try {
    const course = await Course.findById(req.params.id)

    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    })
  } catch (error) {
    console.log(error)
  }
})

router.post('/edit', auth, addCourseValidators, async (req, res) => {
  const errors = validationResult(req)
  const {id} = req.body

  if (!errors.isEmpty()) {
    // вместо перерисовки делаем редирект, но тогда надо придумать как передать errors
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }
   
  try {
    // const {id} = req.body
    delete req.body.id // в Mongo DB id не передаем
    const course = await Course.findById(id)
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    // await Course.findByIdAndUpdate(id, req.body)
    Object.assign(course, req.body)
    await course.save()
    res.redirect('/courses')
  } catch (error) {
    console.log(error)
  }
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id })
    res.redirect('/courses')
  } catch (error) {
    console.log(error)
  }
})

module.exports = router