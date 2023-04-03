import { catchAsync } from '../utils/catchAsync.js';
import Tour from '../models/tourModel.js';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked Tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourID
    }&yser=${req.yser.id}&price=${tour.price}`,
    // success_url: `${req.protocol}://${req.get('host')}/my-tours`, // webhooks
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      // this all fields come from stripe. we cannot use our own fields
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            //   images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// if we use webhook, we don't need this ¬
export const createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price_data });

  res.redirect(req.originalUrl.split('?')[0]);
});

export const getMyTour = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({
    user: req.user.id,
  });

  //   2) Find tours with the returned IDs
  const tourIDs = await bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

// For Webhooks which is for STRIPE
const createCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount; // maybe it needs to change

  await Booking.create({ tour, user, price });
};

export const webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature.process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createCheckout(event.data.object);

  res.status(200).json({
    received: true,
  });
};
