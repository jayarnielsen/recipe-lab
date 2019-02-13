const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdditionSchema = new Schema(
  {
    parentId: Schema.Types.ObjectId
  },
  {
    discriminatorKey: 'kind'
  }
);

const ModificationSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  sortings: [
    {
      parentId: Schema.Types.ObjectId,
      order: [Schema.Types.ObjectId]
    }
  ],
  alterations: [
    {
      sourceId: Schema.Types.ObjectId,
      field: String,
      value: String
    }
  ],
  removals: [
    {
      sourceId: Schema.Types.ObjectId
    }
  ],
  additions: [AdditionSchema]
});

const additionArray = ModificationSchema.path('additions');

additionArray.discriminator(
  'Item',
  new Schema({
    name: {
      type: String,
      required: true
    }
  })
);

additionArray.discriminator(
  'Step',
  new Schema({
    directions: {
      type: String,
      required: true
    },
    notes: {
      type: String
    }
  })
);

additionArray.discriminator(
  'Ingredient',
  new Schema({
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String
    },
    processing: {
      type: String
    }
  })
);

const Modification = mongoose.model('Modification', ModificationSchema);

module.exports = Modification;
