package mail

import (
	"bytes"
	"fmt"
	"text/template"
	"time"
)

// Base Template Layout
const baseTemplateStr = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">DevFlow</h1>
  </div>
  <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #111827; font-size: 24px; margin-top: 0; margin-bottom: 20px;">{{.Title}}</h2>
    <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      {{.Content}}
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
    <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
      © {{.Year}} DevFlow. Keep coding, keep growing.
    </p>
  </div>
</div>
`

var baseTemplate = template.Must(template.New("base").Parse(baseTemplateStr))

func generateHTML(title string, content string) string {
	var buf bytes.Buffer
	data := map[string]interface{}{
		"Title":   title,
		"Content": content,
		"Year":    time.Now().Year(),
	}
	baseTemplate.Execute(&buf, data)
	return buf.String()
}

// Password Reset
const passwordResetTemplateStr = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
  <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
  <p style="color: #555; line-height: 1.6;">Hello,</p>
  <p style="color: #555; line-height: 1.6;">
    You requested to reset your password for your DevFlow account. Click the button below to set a new password. 
    This link will expire in 15 minutes.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{.ResetLink}}" style="background-color: #ec4899; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
      Reset Password
    </a>
  </div>
  <p style="color: #555; line-height: 1.6;">
    If you didn't request a password reset, you can safely ignore this email. Your account is secure.
  </p>
  <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
  <p style="color: #999; font-size: 12px; text-align: center;">
    © {{.Year}} DevFlow. All rights reserved.
  </p>
</div>
`

func BuildPasswordResetEmail(resetLink string) string {
	t := template.Must(template.New("reset").Parse(passwordResetTemplateStr))
	var buf bytes.Buffer
	t.Execute(&buf, map[string]interface{}{
		"ResetLink": resetLink,
		"Year":      time.Now().Year(),
	})
	return buf.String()
}

// Welcome
func BuildWelcomeEmail(name string) string {
	if name == "" {
		name = "Developer"
	}
	content := fmt.Sprintf(`
    <p>Hi %s,</p>
    <p>Welcome to <strong>DevFlow</strong>! We are thrilled to have you join our community of passionate developers.</p>
    <p>Whether you're here to ask questions, share your expertise, or just learn from others, you're in the right place.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="http://localhost:5174/" style="background-color: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Explore DevFlow
      </a>
    </div>
    <p>Happy coding!</p>
    <p>— The DevFlow Team</p>
  `, name)
	return generateHTML("Welcome Aboard!", content)
}

// Answer Notification
func BuildAnswerNotificationEmail(name string, questionTitle string, link string) string {
	content := fmt.Sprintf(`
    <p>Hi %s,</p>
    <p>Great news! Someone just posted a new answer to your question:</p>
    <blockquote style="border-left: 4px solid #ec4899; margin: 20px 0; padding-left: 15px; font-style: italic; color: #374151;">
      "%s"
    </blockquote>
    <p>Click the button below to view the answer and join the discussion.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="%s" style="background-color: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        View Answer
      </a>
    </div>
    <p>— The DevFlow Team</p>
  `, name, questionTitle, link)
	return generateHTML("You have a new answer", content)
}

// Achievement
func BuildAchievementEmail(name string, reputation int) string {
	content := fmt.Sprintf(`
    <p>Hi %s,</p>
    <p>Congratulations! Your contributions are making a real impact.</p>
    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
      <h3 style="color: #92400e; margin: 0; font-size: 20px;">Reputation Milestone</h3>
      <p style="color: #b45309; font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">
        %d Points
      </p>
    </div>
    <p>Thank you for helping others and being an amazing part of the DevFlow community. Keep up the excellent work!</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="http://localhost:5174/profile" style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        View Profile
      </a>
    </div>
    <p>— The DevFlow Team</p>
  `, name, reputation)
	return generateHTML("Milestone Reached!", content)
}

// New Login
func BuildNewLoginEmail(name string, device string, os string, browser string, ip string, loginTime string) string {
	if device == "" {
		device = "Unknown Device"
	}
	if os == "" {
		os = "Unknown OS"
	}
	if browser == "" {
		browser = "Unknown Browser"
	}
	content := fmt.Sprintf(`
    <p>Hi %s,</p>
    <p>We noticed a new login to your DevFlow account from a new device.</p>
    <div style="background-color: #f3f4f6; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Device:</strong> %s</p>
      <p style="margin: 0 0 10px 0;"><strong>OS:</strong> %s</p>
      <p style="margin: 0 0 10px 0;"><strong>Browser:</strong> %s</p>
      <p style="margin: 0 0 10px 0;"><strong>IP Address:</strong> %s</p>
      <p style="margin: 0;"><strong>Time:</strong> %s</p>
    </div>
    <p>If this was you, you can safely ignore this email.</p>
    <p>If you don't recognize this activity, please secure your account by logging out of all devices and resetting your password immediately.</p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="http://localhost:5174/profile" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Review Account Activity
      </a>
    </div>
    <p>— The DevFlow Security Team</p>
  `, name, device, os, browser, ip, loginTime)
	return generateHTML("New Login Detected", content)
}
