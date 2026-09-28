import { describe,it,expect,vi,afterEach } from 'vitest';
import type { VercelRequest,VercelResponse } from '@vercel/node';
const sendMail=vi.fn();vi.mock('nodemailer',()=>({default:{createTransport:()=>({sendMail,close:vi.fn()})}}));
import { inquirySchema,projectSchema,allowedOrigin,createHandler } from '../server/inquiry';
const valid={name:'Test Person',email:'test@example.com',message:'Please help us build a new website.',service:'web-design',consent:'yes'};
function response(){const res={status:vi.fn(),json:vi.fn(),setHeader:vi.fn()};res.status.mockReturnValue(res);res.json.mockReturnValue(res);return res;}
function request(body:unknown=valid){return {method:'POST',headers:{origin:'https://cactusdigitalmedia.ng','content-type':'application/json'},body,socket:{remoteAddress:'127.0.0.1'}} as unknown as VercelRequest;}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.clearAllMocks();});
describe('Inquiry boundaries',()=>{
 it('accepts a valid contact inquiry',()=>expect(inquirySchema.safeParse(valid).success).toBe(true));
 it.each([{email:'invalid'},{message:'short'},{consent:'no'},{service:'fake'},{name:'Name\r\nBcc: other@example.com'}])('rejects invalid input %j',change=>expect(inquirySchema.safeParse({...valid,...change}).success).toBe(false));
 it('requires budget and timeline for project inquiries',()=>expect(projectSchema.safeParse(valid).success).toBe(false));
 it('requires a phone for WhatsApp preference',()=>expect(projectSchema.safeParse({...valid,budget:'Discuss',timeline:'Flexible',preferredContact:'WhatsApp'}).success).toBe(false));
 it('does not trust arbitrary origins',()=>{expect(allowedOrigin('https://evil.example',{})).toBe(false);expect(allowedOrigin(undefined,{})).toBe(false);expect(allowedOrigin('https://preview.vercel.app',{ALLOWED_ORIGINS:'https://preview.vercel.app'})).toBe(true);});
 it('rejects GET',async()=>{const res=response();await createHandler()({...request(),method:'GET'} as VercelRequest,res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(405);});
 it('rejects invalid origin',async()=>{const req=request();req.headers.origin='https://evil.example';const res=response();await createHandler()(req,res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(403);});
 it('rejects honeypot rather than simulating delivery',async()=>{const res=response();await createHandler()(request({...valid,fax:'bot'}),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(400);expect(sendMail).not.toHaveBeenCalled();});
 it('does not claim success when SMTP is unconfigured',async()=>{vi.stubEnv('SMTP_HOST','');const res=response();await createHandler()(request(),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(503);expect(sendMail).not.toHaveBeenCalled();});
});
function configure(){for(const name of ['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM','CONTACT_TO','UPSTASH_REDIS_REST_TOKEN','RATE_LIMIT_SALT'])vi.stubEnv(name,'test-value');vi.stubEnv('UPSTASH_REDIS_REST_URL','https://redis.example');}
describe('Delivery and abuse protection',()=>{
 it('fails closed when rate limiting is unavailable',async()=>{configure();vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const res=response();await createHandler()(request(),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(503);expect(sendMail).not.toHaveBeenCalled();});
 it('blocks after five submissions',async()=>{configure();vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({result:6})}));const res=response();await createHandler()(request(),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(429);expect(sendMail).not.toHaveBeenCalled();});
 it('reports failure when provider rejects delivery',async()=>{configure();vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({result:1})}));sendMail.mockResolvedValue({accepted:[]});const res=response();await createHandler()(request(),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(502);});
 it('returns success only after provider acceptance',async()=>{configure();vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({result:1})}));sendMail.mockResolvedValue({accepted:['inbox@example.com']});const res=response();await createHandler()(request(),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(200);expect(sendMail.mock.calls[0][0].replyTo).toBe(valid.email);});
});
