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

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Not JSON
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || `Database query failed with status ${response.status}`);
      }

      if (!data) {
        console.error(`Expected JSON but got: ${text.substring(0, 200)}`);
        throw new Error('Server returned non-JSON response');
      }

      return data;
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
