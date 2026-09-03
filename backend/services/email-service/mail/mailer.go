package mail

import (
	"fmt"
	"net/smtp"
	"os"
)

type Mailer struct {
	User     string
	Password string
}

func NewMailer() *Mailer {
	return &Mailer{
		User:     os.Getenv("EMAIL_USER"),
		Password: os.Getenv("EMAIL_APP_PASSWORD"),
	}
}

func (m *Mailer) SendEmail(to, subject, htmlBody string) error {
	from := m.User
	if from == "" {
		fmt.Printf("Simulating Email Send to %s (Subject: %s)\n", to, subject)
		return nil
	}

	host := "smtp.gmail.com"
	port := "587"

	auth := smtp.PlainAuth("", from, m.Password, host)

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("DevFlow <%s>", from)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	err := smtp.SendMail(host+":"+port, auth, from, []string{to}, []byte(message))
	if err != nil {
		fmt.Printf("Failed to send email to %s: %v\n", to, err)
		return err
	}
	fmt.Printf("Email successfully sent to %s (Subject: %s)\n", to, subject)
	return nil
}

func (m *Mailer) SendPasswordReset(to, link string) {
	html := BuildPasswordResetEmail(link)
	m.SendEmail(to, "DevFlow - Password Reset Request", html)
}

func (m *Mailer) SendWelcome(to, name string) {
	html := BuildWelcomeEmail(name)
	m.SendEmail(to, "Welcome to DevFlow! 🎉", html)
}

func (m *Mailer) SendAnswerNotification(to, name, questionTitle, link string) {
	html := BuildAnswerNotificationEmail(name, questionTitle, link)
	m.SendEmail(to, "New Answer to your Question!", html)
}

func (m *Mailer) SendAchievement(to, name string, reputation int) {
	html := BuildAchievementEmail(name, reputation)
	m.SendEmail(to, fmt.Sprintf("Achievement Unlocked: %d Reputation! 🏆", reputation), html)
}

func (m *Mailer) SendNewLogin(to, name, device, os, browser, ip, timeStr string) {
	html := BuildNewLoginEmail(name, device, os, browser, ip, timeStr)
	m.SendEmail(to, "Security Alert: New Login Detected", html)
}
