import path from 'path';
import crypto from 'crypto';
import { Cineplex } from '../models';
import multer from 'multer';

// SET STORAGE
let storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/img/cineplexs/');
  },
  filename(req, file, cb) {
    cb(null, crypto.randomBytes(18).toString('hex') + path.extname(file.originalname));
  },
});

let upload = multer({ storage }).single('image');

const create = (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.send({ error: err.message });
      if (!req.file) return res.send({ error: 'Missing Cineplex image.' });

      req.body.image = 'http://127.0.0.1:5000/img/cineplexs/' + req.file.filename;

      const { name, address, image } = req.body;

      const newCineplex = await Cineplex.create({
        name,
        address,
        image,
      });

      if (newCineplex) {
        return res.status(200).send({ message: 'Success' });
      } else {
        return res.status(400).send({ message: 'Fail' });
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const cineplexs = await Cineplex.findAll();
    return res.status(200).send({
      cineplexs,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cineplex = await Cineplex.findByPk(id);
    if (cineplex) {
      return res.status(200).send({ cineplex });
    } else {
      return res.status(400).send({ error: 'Cineplex not found' });
    }
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cineplex = await Cineplex.findByPk(id);
    if (cineplex) {
      upload(req, res, async (err) => {
        if (err) return res.send({ error: err.message });
        if (req.file) {
          cineplex.image = 'http://127.0.0.1:5000/img/movies/' + req.file.filename;
          await cineplex.save();
        }

        const { name, address } = req.body;

        const parserData = {
          name,
          address,
        };

        await cineplex.update(parserData);
        return res.status(200).send({ message: 'Updated' });
      });
    } else {
      return res.status(400).send({ error: 'Cineplex not found' });
    }
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cineplex = await Cineplex.findByPk(id);
    if (cineplex) {
      await cineplex.destroy();
      return res.status(200).send({ message: 'Deleted' });
    } else {
      return res.status(400).send({ error: 'Cineplex not found' });
    }
  } catch (error) {
    next(error);
  }
};

export { create, getAll, getById, update, remove };