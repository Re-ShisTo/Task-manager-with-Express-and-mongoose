import nodemailer from "nodemailer";

export const sendEmail = async(email, subject, message)=>{
    //transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'laurianne.murray@ethereal.email',
            pass: '4DYKjcjVTJk47rnXNM'
        }
    });

    // Mail options
    const mailOption = {
        from: "info@teamrabbil.com",
        to: email,
        subject: subject,
        text: message
    }

    // Send mail
    try{
        await transporter.sendMail(mailOption)
        console.log("Email sent successfully")
    }catch(e){
        console.error("Error sending mail:", e)
    }
}

// (async()=>{
//     await sendEmail("poranchakma234@gmail.com", "Test", "This is a test email")
// })()