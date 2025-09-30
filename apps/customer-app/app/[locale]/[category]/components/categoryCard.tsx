import React from 'react';

export const CategoryDetailCard = ({
  activeIcon,
  activeName,
  activeDesc,
}: {
  activeIcon: string;
  activeName: string;
  activeDesc: string;
}) => {
  return (
    <section
      style={{
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ position: 'relative', height: 180, background: '#f3f4f6' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
          }}
        >
          {activeIcon}
        </div>
        {(activeIcon || activeName) && (
          <div
            style={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 22 }}>{activeIcon}</span>
            <strong style={{ fontSize: 18 }}>{activeName}</strong>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', color: '#374151' }}>{activeDesc}</div>
    </section>
  );
};
