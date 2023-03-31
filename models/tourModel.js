import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
import User from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name  must have less or equal than 40'],
      minlegth: [10, 'A tour...'],
      //   validate: [validator.isAlpha, 'error message'], // imported validator that work only with strings
      // trim: true   // this schema remove white spaces start and bottom
    },
    slug: String,
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must...'],
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      ValidityState: {
        validator: function (val) {
          // this only point to current doc on NEW document creation
          return val < this.price; // if price value < this value, then it will be an false
        },
        message: 'Discount... ({VALUE})',
      }, //our own validation
    },
    difficulty: {
      type: String,
      require: [true, 'text...'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either: easy...',
      }, //only this three is relevant. only for strings
    },
    //   images: [String],
    createdAd: {
      type: Date,
      default: Date.now(),
      select: false, //not show while response
    },
    startDates: [Date], //manual date
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // for 2+ children. we also need middleWare down (Embedding)
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], //Adding only IDs
  },
  {
    // this is for Options
    toJSON: { virtuals: true }, //show virtual schema
    toObject: { virtuals: true },
  }
);

// virtual schema than not show in response
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //if we have a duration field
});

// mongoose has 4 types of middleware

// 1) Document MIddleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//  <!  If guides is Array  - Embedding !>
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// 2) QUERY Middleware
tourSchema.pre(/^find/, function (next) {
  //this /^find/ means all kind of find function
  this.find({ secretTour: { $ne: true } }); //show only not secrets

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  // This help us to show objects which are connected other objects with ID (key)
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //   console.log(Date.now() - this.start);
  next();
});

// AGGREGATION Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
