  const emailjs = require('@emailjs/nodejs');               
  const fs = require('fs');

  console.log("Running email job...");                                          
   
  if (!fs.existsSync('tasks.json')) {                                           
    console.error('tasks.json not found');                  
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));               
  const incompleteTasks = (data.tasks || []).filter(t => !t.completed);
                                                                                
  const taskList = incompleteTasks.length > 0               
    ? incompleteTasks.map(t => {
        let line = '- ' + t.text + ' (' + t.subject + ')';                      
        if (t.notes) line += '\n  Notes: ' + t.notes;
        if (t.subtasks && t.subtasks.length > 0) {                              
          const pending = t.subtasks.filter(s => !s.completed);                 
          if (pending.length > 0)
            line += '\n  Subtasks: ' + pending.map(s => s.text).join(', ');     
        }                                                                       
        return line;
      }).join('\n')                                                             
    : 'No tasks today!';                                    

  console.log('Tasks to send:', taskList);                                      
   
  emailjs.send(                                                                 
    process.env.SERVICE_ID,                                 
    process.env.TEMPLATE_ID,
    {
      to_email: data.email,
      date: new Date().toLocaleDateString(),
      task_list: taskList                                                       
    },
    {                                                                           
      publicKey: process.env.PUBLIC_KEY,                    
      privateKey: process.env.PRIVATE_KEY
    }
  )
  .then(() => { console.log('Email sent successfully!'); })
  .catch(err => { console.error('Failed:', err); process.exit(1); }); 
