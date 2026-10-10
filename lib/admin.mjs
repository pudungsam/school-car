export function isAdmin(req){const secret=process.env.ADMIN_TOKEN||(process.env.NODE_ENV==='production'?null:'school-admin-local');return Boolean(secret&&req.headers.get('x-admin-token')===secret);}
