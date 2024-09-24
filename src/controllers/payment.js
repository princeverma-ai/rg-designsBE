import Razorpay from "razorpay";
import catchAsync from "../utils/catchAsync.js";
import Product from "../models/product.js";
import AppError from "../utils/AppError.js";
import Transaction from "../models/transaction.js";
import Coupon from "../models/coupon.js";
import CustomOrder from "../models/customOrder.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize Stripe
const currency = process.env.CURRENCY;
const currencyUnitAmount = process.env.CURRENCY_UNIT_AMOUNT;

// Create a checkout session
const createCheckoutSession = async (totalAmount, receipt) => {
  try {
    const options = {
      amount: totalAmount,
      currency: currency,
      receipt: String(receipt),
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create checkout session");
  }
};

const checkoutSession = catchAsync(async (req, res, next) => {
  let razorpayOrder;
  let transactionData = {
    lineItems: [],
    amount: 0,
    user: req.user._id,
    couponCode: null,
    couponDiscount: 0,
  };

  if (req.body.customOrder) {
    const customOrder = await CustomOrder.findById(req.body.customOrder);
    if (!customOrder) {
      return next(new AppError("Custom order not found", 404));
    }
    if (customOrder.isPaid) {
      return next(new AppError("Custom order already paid", 400));
    }
    transactionData.amount = customOrder.quoteAmount;
    razorpayOrder = await createCheckoutSession(
      customOrder.quoteAmount * currencyUnitAmount,
      customOrder._id
    );
  } else {
    const rawLineItems = req.body.lineItems;
    let totalAmount = 0;

    for (let i = 0; i < rawLineItems.length; i++) {
      const product = await Product.findById(rawLineItems[i]);
      if (!product) {
        return next(new AppError(`Product not found: ${rawLineItems[i]}`, 404));
      }
      totalAmount += product.price * currencyUnitAmount;
      transactionData.lineItems.push({
        product: product._id,
        amount: product.price,
      });
    }

    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });
      if (!coupon) {
        return next(new AppError("Invalid coupon code", 400));
      }
      if (coupon.expiryDate < Date.now()) {
        return next(new AppError("Coupon has expired", 400));
      }
      const discountAmount = (totalAmount * coupon.discountPercentage) / 100;
      totalAmount = Math.floor(totalAmount - discountAmount);
      transactionData.couponCode = req.body.couponCode;
      transactionData.couponDiscount = (
        discountAmount / currencyUnitAmount
      ).toFixed(2);
    }

    transactionData.amount = totalAmount / currencyUnitAmount;

    const newTransaction = await Transaction.create(transactionData);
    razorpayOrder = await createCheckoutSession(
      totalAmount,
      newTransaction._id
    );
  }

  res.status(200).json({ razorpayOrder });
});

const webhook = catchAsync(async (req, res, next) => {
  try {
    const body = JSON.parse(req.body);
    if (body.event === "order.paid") {
      // Update the transaction
      const receipt = body.payload.order.entity.receipt;
      const customOrder = await CustomOrder.findById(receipt);
      const transaction = await Transaction.findById(receipt);
      if (customOrder) {
        if (customOrder.isPaid) {
          return next(new AppError("Custom order already paid", 400));
        }
        await CustomOrder.findByIdAndUpdate(customOrder._id, {
          isPaid: true,
        });
      }
      if (transaction) {
        if (transaction.isPaid) {
          return next(new AppError("Transaction already paid", 400));
        }
        await Transaction.findByIdAndUpdate(transaction._id, {
          isPaid: true,
        });

        // add to total buyers of that product
        const lineItems = transaction.lineItems;
        for (let i = 0; i < lineItems.length; i++) {
          await Product.findByIdAndUpdate(lineItems[i], {
            $inc: { buyersCount: 1 },
          });
        }
      } else {
        return next(new AppError("Transaction or Custom Order not found", 404));
      }
    }
  } catch (error) {
    return next(new AppError("Invalid webhook", 400));
  }
});

export { checkoutSession, webhook };
