import React from "react";

function ContactPage() {
  return (
    <section id="contact-page" className="page active">
      <div className="container">
        <div class="contact">
          <h1 class="page-title">Contact Us</h1>

          <div class="contact__content">
            <div class="contact__form">
              <form id="contact-form" class="form">
                <div class="form-group">
                  <label class="form-label" for="name">Full Name</label>
                  <input type="text" id="name" name="name" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="email">Email Address</label>
                  <input type="email" id="email" name="email" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="subject">Subject</label>
                  <input type="text" id="subject" name="subject" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="message">Message</label>
                  <textarea id="message" name="message" class="form-control" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn--primary btn--full-width">Send Message</button>
              </form>
            </div>

            <div class="contact__info">
              <div class="card">
                <div class="card__body">
                  <h3>Cinema Information</h3>
                  <div class="contact-item">
                    <strong>🏢 Address:</strong>
                    <p>Khatri Hostel, Near 5th road, Jodhpur</p>
                  </div>
                  <div class="contact-item">
                    <strong>📞 Phone:</strong>
                    <p>+91 7568170690</p>
                  </div>
                  <div class="contact-item">
                    <strong>📧 Email:</strong>
                    <p>madhuban211998@gmail.com</p>
                  </div>
                  <div class="contact-item">
                    <strong>🕒 Hours:</strong>
                    <p>Daily 9:00 AM - 11:30 PM</p>
                  </div>
                  <div class="contact-item">
                    <strong>🎬 Facilities:</strong>
                    <p>IMAX, Dolby Atmos, Reclining Seats, Concessions, Parking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ... */}

      </div>
    </section>
  );
}

export default ContactPage;