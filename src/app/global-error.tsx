'use client';

import { Button, Result } from 'antd';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <Result
          status="error"
          title="Something went wrong!"
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={() => reset()}>
              Try again
            </Button>
          }
        />
      </body>
    </html>
  );
}
