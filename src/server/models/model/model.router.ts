import { Router } from 'express';
import { ModelService } from './model.service';

export const modelRouter = Router({ mergeParams: true });

modelRouter.get('', (req, res, next) => {
  console.log('[GET]/api/models/:id', req.params.id);

  new ModelService().getById(req.params.id)
    .then((model) => res.json({
      data: model,
      success: true,
      message: 'Model was fetched success',
    })).catch(err => next());
});

// modelRouter.get('', (req, res, next) => {
//   console.log('[GET]/api/models/name/:name', req.params.name);

//   new ModelService().getByName(req.params.name)
//     .then((model) => res.json({
//       data: model,
//       success: true,
//       message: 'Model was founed by name',
//     })).catch(err => next(err));
// });

modelRouter.put('', (req, res, next) => {
  console.log('[PUT]/api/models/:id', { id: req.params.id, body: req.body });

  new ModelService().update(req.params.id, req.body)
    .then((model) => res.json({
      data: model,
      success: true,
      message: 'Model was updated',
    })).catch(err => next(err));
});

modelRouter.delete('', (req, res, next) => {
  console.log('[DELETE]/api/models/:id', { id: req.params.id });

  new ModelService().deleteById(req.params.id)
    .then(() => res.json({
      data: {},
      success: true,
      message: 'Model was removed'
    })).catch(err => next(err));
});
