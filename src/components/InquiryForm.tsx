import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { services, brand } from '../data/site';
import { Arrow } from './Shared';
export default function InquiryForm({project=false}:{project?:boolean}) {
 const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle');const [message,setMessage]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>) {
  e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));setState('sending');
  try {const response=await fetch(project?'/api/project':'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new Error(result.error||'We could not send your inquiry. Please try again.');setMessage('Your inquiry has been sent. We’ll reply using the contact details you provided.');setState('success');form.reset();}
  catch(error){setState('error');setMessage(error instanceof Error && !error.message.includes('JSON') ? error.message : 'Your inquiry could not be sent. Please email us or use WhatsApp.');}
 }
 return <form onSubmit={submit} className="inquiry-form"><div className="form-grid">
 <label>Your name <span>*</span><input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label>
 <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
 <label>Company<input name="company" autoComplete="organization" maxLength={150}/></label>
 <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>
 <label className="full">What can we help with? <span>*</span><select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.shortLabel}</option>)}<option value="not-sure">Let’s figure it out together</option></select></label>
 {project&&<><label>Budget range <span>*</span><select name="budget" required defaultValue=""><option value="" disabled>Select a range</option><option>Under ₦1 million</option><option>₦1–3 million</option><option>₦3–10 million</option><option>Above ₦10 million</option><option>Let’s discuss</option></select></label><label>Desired timeline <span>*</span><select name="timeline" required defaultValue=""><option value="" disabled>Select a timeline</option><option>Within 1 month</option><option>1–3 months</option><option>3–6 months</option><option>Flexible</option></select></label><label>Existing website or app<input name="website" type="url" placeholder="https://" maxLength={500}/></label><label>Preferred contact method<select name="preferredContact"><option>Email</option><option>Phone</option><option>WhatsApp</option></select></label></>}
 <label className="full">{project?'Tell us about your project':'Your message'} <span>*</span><textarea name="message" required minLength={20} maxLength={5000} rows={5} placeholder="What would you like to build or improve?"/></label>
 </div><div className="honey" aria-hidden="true"><label>Leave this field empty<input name="fax" tabIndex={-1} autoComplete="off"/></label></div>
 <label className="consent"><input type="checkbox" name="consent" value="yes" required/> <span>I agree to the <Link to="/privacy">privacy policy</Link> and to being contacted about this inquiry.</span></label>
 <button className="button dark" disabled={state==='sending'} type="submit">{state==='sending'?'Sending…':project?'Send project brief':'Send message'}<Arrow diagonal/></button>
 <p className={`form-status ${state}`} role={state==='error'?'alert':'status'} aria-live="polite">{message}</p>
 {state==='error'&&<a className="text-link" href={`mailto:${brand.email}`}>Email {brand.email}<Arrow/></a>}
 </form>;
}
