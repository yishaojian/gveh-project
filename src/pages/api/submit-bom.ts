import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const email = formData.get('email') as string;
    const bomText = formData.get('bomText') as string;
    const file = formData.get('file') as File | null;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload: {
      email: string;
      bomText?: string;
      file?: {
        name: string;
        type: string;
        size: number;
        buffer: string;
      };
      timestamp: string;
    } = {
      email,
      bomText: bomText || undefined,
      timestamp: new Date().toISOString()
    };

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      payload.file = {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: buffer.toString('base64')
      };
    }

    console.log('[BOM Submit] Received submission:', {
      email: payload.email,
      hasFile: !!payload.file,
      fileName: payload.file?.name,
      fileSize: payload.file?.size,
      hasBomText: !!payload.bomText,
      timestamp: payload.timestamp
    });

    const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL;
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const SERVER_CHAN_KEY = import.meta.env.SERVER_CHAN_KEY;

    if (ADMIN_EMAIL && RESEND_API_KEY) {
      const emailSubject = `新 BOM 询价 - ${email}`;
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
              <h2 style="color: #333;">新 BOM 询价提交</h2>
              <p><strong>客户邮箱:</strong> ${email}</p>
              <p><strong>提交时间:</strong> ${new Date(payload.timestamp).toLocaleString('zh-CN')}</p>
              
              ${bomText ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #f39c12;">
                  <h3 style="color: #555; margin-top: 0;">BOM 内容:</h3>
                  <pre style="white-space: pre-wrap; word-wrap: break-word; color: #333;">${bomText}</pre>
                </div>
              ` : ''}
              
              ${payload.file ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #27ae60;">
                  <h3 style="color: #555; margin-top: 0;">附件信息:</h3>
                  <p><strong>文件名:</strong> ${payload.file.name}</p>
                  <p><strong>文件大小:</strong> ${(payload.file.size / 1024).toFixed(2)} KB</p>
                  <p><strong>文件类型:</strong> ${payload.file.type}</p>
                </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
                <p>此邮件由 PNDS BOM Hub 自动发送</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const attachments: any[] = [];
      if (payload.file) {
        attachments.push({
          filename: payload.file.name,
          content: Buffer.from(payload.file.buffer, 'base64')
        });
      }

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'PNDS BOM Hub <onboarding@resend.dev>',
          to: ADMIN_EMAIL,
          subject: emailSubject,
          html: emailHtml,
          attachments: attachments.length > 0 ? attachments : undefined
        })
      });

      if (resendResponse.ok) {
        console.log('[Resend] Email sent successfully');
      } else {
        const errorData = await resendResponse.json();
        console.error('[Resend] Failed to send email:', errorData);
      }
    } else {
      console.warn('[Resend] Not configured, skipping email notification');
    }

    if (SERVER_CHAN_KEY) {
      const notifyTitle = '新 BOM 询价';
      const notifyDesp = `客户邮箱：${email}%0A提交时间：${new Date(payload.timestamp).toLocaleString('zh-CN')}%0A${bomText ? 'BOM 内容：' + bomText.substring(0, 100) : '无 BOM 内容'}${payload.file ? '%0A附件：' + payload.file.name : ''}`;
      
      try {
        const notifyResponse = await fetch(
          `https://sctapi.ftqq.com/${SERVER_CHAN_KEY}.send?title=${encodeURIComponent(notifyTitle)}&desp=${notifyDesp}`,
          { method: 'GET' }
        );
        
        if (notifyResponse.ok) {
          console.log('[ServerChan] WeChat notification sent successfully');
        } else {
          console.error('[ServerChan] Failed to send WeChat notification');
        }
      } catch (notifyError) {
        console.error('[ServerChan] Error sending notification:', notifyError);
      }
    } else {
      console.warn('[ServerChan] Not configured, skipping WeChat notification');
    }

    const redirectUrl = request.headers.get('referer') || '/bom-hub';
    const separator = redirectUrl.includes('?') ? '&' : '?';
    return new Response(null, {
      status: 303,
      headers: {
        'Location': `${redirectUrl}${separator}status=success`
      }
    });

  } catch (error) {
    console.error('[BOM Submit] Error processing request:', error);
    
    const redirectUrl = request.headers.get('referer') || '/bom-hub';
    const separator = redirectUrl.includes('?') ? '&' : '?';
    return new Response(null, {
      status: 303,
      headers: {
        'Location': `${redirectUrl}${separator}status=error`
      }
    });
  }
};
