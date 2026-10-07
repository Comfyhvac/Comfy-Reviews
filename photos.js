(() => {
  const $=id=>document.getElementById(id);
  const today=new Date();$('jobDate').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  let files=[],gps=null,jobId=null,busy=false,previewUrls=[];
  const api=(window.COMFY_PHOTO_API||'').replace(/\/$/,'');
  function geo(){return new Promise((resolve,reject)=>{
    if(!navigator.geolocation)return reject(new Error('Location access is unavailable.'));
    navigator.geolocation.getCurrentPosition(p=>{gps={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp};
      $('gpsStatus').textContent=`Job location recorded (GPS accuracy about ${Math.round(gps.accuracy)} m). This is the phone's current location, not extracted from photo metadata.`;resolve(gps);
    },()=>{gps=null;$('gpsStatus').textContent='Allow location access at the job site to send a location-tagged project.';reject(new Error('Location access required for a project post.'));},
    {enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });}
  const reveal=()=>{$('projectStep').hidden=true;$('reviewStep').hidden=false;$('newJob').hidden=false;};
  $('photos').addEventListener('change',()=>{
    previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];$('photoPreview').replaceChildren();
    files=Array.from($('photos').files);jobId=null;
    if(files.length>3||files.some(f=>f.size>5*1024*1024||!['image/jpeg','image/png'].includes(f.type))){
      files=[];$('uploadStatus').textContent='Choose 1–3 JPG or PNG photos, each under 5 MB. Export HEIC photos as JPG first.';return;
    }
    files.forEach(f=>{const img=document.createElement('img');img.alt='Selected job photo';img.src=URL.createObjectURL(f);previewUrls.push(img.src);$('photoPreview').append(img);});
    $('uploadStatus').textContent='';void geo().catch(()=>{});
  });
  function encode(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({base64:reader.result.split(',')[1]});reader.onerror=()=>reject(new Error('Photo could not be read.'));reader.readAsDataURL(file);});}
  function lock(value){busy=value;['submitProject','photos','summary','jobDate','permission','accessCode','locationSelect','retry','skipPhotos'].forEach(id=>$(id).disabled=value);}
  async function check(id,token){
    const response=await fetch(`${api}/jobs/${id}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Unable to check project status.');
    const status=await response.json();$('uploadStatus').textContent=status.message;
    if(!$('reviewStep').hidden)$('status').textContent=status.message;
    if(status.status==='queued'||status.status==='uploading'){
      setTimeout(()=>{void check(id,token).catch(()=>{$('uploadStatus').textContent='Project saved. Status check unavailable; the office can check the saved job.';});},4000);
    }
  }
  $('submitProject').addEventListener('click',async()=>{
    if(busy)return;
    if(!api){$('uploadStatus').textContent='Project publishing is not connected yet. The office must finish the Google connection and photo service setup.';return;}
    const token=$('accessCode').value.trim(),summary=$('summary').value.trim();
    if(!files.length||summary.length<10||!$('permission').checked||!token){$('uploadStatus').textContent='Add photos, a description, customer permission, and your technician access code.';return;}
    if(!window.comfySelectedLocation){$('uploadStatus').textContent='Select a configured Comfy profile first.';return;}
    lock(true);
    try{
      // Once a job has an ID, retries use the same submitted data/ID. Editing controls
      // resets the ID only before a confirmed save.
      if(!jobId)jobId=crypto.randomUUID();
      const position=await geo();$('uploadStatus').textContent='Saving project photos…';
      const payload={id:jobId,locationId:window.comfySelectedLocation,gps:position,jobDate:$('jobDate').value,summary,customerPermission:true,photos:await Promise.all(files.map(encode))};
      const response=await fetch(`${api}/jobs`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload),signal:AbortSignal.timeout(90000)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Project could not be saved.');
      $('uploadStatus').textContent=result.message;
      reveal();$('status').textContent='Project saved for automatic posting. The customer can now scan this review code.';
      void check(jobId,token).catch(()=>{});
    }catch(error){$('uploadStatus').textContent=error.message+'. Your photos have not been cleared; retry to check or save this same job.';}
    finally{lock(false);}
  });
  $('skipPhotos').addEventListener('click',reveal);
  $('newJob').addEventListener('click',()=>location.reload());
  $('uploadStatus').textContent=api?'':'Google project publishing setup is pending.';
  void geo().catch(()=>{});
})();
