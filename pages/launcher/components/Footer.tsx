import Link from 'next/link';
import React, { Component } from 'react';

export default class extends Component {
  render(): React.ReactNode {
    return (
      <footer>
        <p>Copyright © 2025 Croissant Inventory System</p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            textAlign: 'center',
            verticalAlign: 'middle',
            justifyContent: 'center',
          }}
        >
          <Link href='/terms'>Terms of Service</Link>
          <Link href='/privacy'>Privacy Policy</Link>
        </div>
      </footer>
    );
  }
}
