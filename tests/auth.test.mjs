import {test} from 'node:test';
import assert from 'node:assert/strict';
import {signSession,verifySession} from '../lib/auth.mjs';
test('session rejects tampering and expiry',()=>{process.env.AUTH_SECRET='test-only-session-secret-32-characters';const signed=signSession({user:{name:'테스트'},exp:Date.now()+10000});assert.equal(verifySession(signed).user.name,'테스트');assert.equal(verifySession(signed+'x'),null);assert.equal(verifySession(signSession({exp:Date.now()-1})),null);assert.equal(verifySession('invalid'),null);});
