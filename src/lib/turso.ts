const client = {
  execute: async (sqlOrObject: string | { sql: string, args?: any[] }) => {
    const sql = typeof sqlOrObject === 'string' ? sqlOrObject : sqlOrObject.sql;
    const args = typeof sqlOrObject === 'string' ? [] : sqlOrObject.args;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, args }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const text = await response.text();
          console.error(`Query failed with status ${response.status}. Response: ${text.substring(0, 200)}`);
          throw new Error(`Database query failed with status ${response.status}`);
        }
        throw new Error(errorData.details || errorData.error || 'Database query failed');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
        throw new Error('Server returned non-JSON response');
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Database query timed out');
      }
      throw error;
    }
  }
};

export default client;
