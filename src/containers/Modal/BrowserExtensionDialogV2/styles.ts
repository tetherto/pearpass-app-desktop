export const styles = {
  dialog: {
    backgroundColor: '#15180e',
    border: '1px solid #212814',
    borderRadius: '8px',
    width: '500px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden'
  },
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #212814',
    overflow: 'hidden'
  },
  headerTitle: {
    color: 'white',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    margin: 0,
    whiteSpace: 'nowrap' as const
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '6px',
    flexShrink: 0
  },
  body: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '24px',
    gap: '32px',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    position: 'relative' as const
  },
  browserMockup: {
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    borderRadius: '8px',
    overflow: 'hidden',
    height: '80px'
  },
  tabBar: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#202124',
    opacity: 0.5,
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    height: '42px',
    boxSizing: 'border-box' as const
  },
  tabActive: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: '9px',
    padding: '8px',
    borderRadius: '8px 8px 0 0',
    backgroundColor: '#35363a',
    overflow: 'hidden'
  },
  tabFavicon: {
    width: '16px',
    height: '16px',
    borderRadius: '16px',
    backgroundColor: '#a7a7a7',
    flexShrink: 0
  },
  tabTitle: {
    width: '82px',
    height: '10px',
    borderRadius: '11px',
    backgroundColor: '#a7a7a7'
  },
  tabClose: {
    width: '18px',
    height: '18px',
    color: '#a7a7a7'
  },
  tabPlus: {
    color: '#a7a7a7',
    fontSize: '16px'
  },
  urlBar: {
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 12px',
    backgroundColor: '#35363a',
    height: '38px',
    boxSizing: 'border-box' as const
  },
  urlNavIcons: {
    display: 'flex' as const,
    gap: '4px',
    opacity: 0.5,
    alignItems: 'center'
  },
  navIcon: {
    width: '16px',
    height: '16px',
    color: '#a7a7a7'
  },
  urlInputWrapper: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: '3px',
    padding: '6px 10px',
    backgroundColor: '#202124',
    borderRadius: '14px',
    height: '28px',
    boxSizing: 'border-box' as const,
    opacity: 0.5,
    flex: 1,
    margin: '0 12px',
    overflow: 'hidden'
  },
  urlLock: {
    width: '12px',
    height: '12px',
    color: '#a7a7a7',
    flexShrink: 0
  },
  urlText: {
    flex: 1,
    height: '10px',
    borderRadius: '11px',
    backgroundColor: '#2b2c2f'
  },
  urlStar: {
    width: '16px',
    height: '16px',
    color: '#a7a7a7',
    flexShrink: 0
  },
  urlRightIcons: {
    display: 'flex' as const,
    gap: '13px',
    alignItems: 'center'
  },
  vaultSymbol: {
    width: '28px',
    height: '28px',
    borderRadius: '28px',
    backgroundColor: '#202124',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b0d944',
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: 700
  },
  moreIcon: {
    width: '16px',
    height: '16px',
    color: '#a7a7a7',
    opacity: 0.5
  },
  textContent: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '12px',
    width: '100%',
    textAlign: 'center' as const,
    lineHeight: 'normal'
  },
  heading: {
    fontFamily: "'Humble Nostalgia', sans-serif",
    fontSize: '28px',
    fontWeight: 400,
    color: 'white',
    margin: 0,
    whiteSpace: 'pre-wrap' as const
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    color: '#bdc3ac',
    margin: 0,
    whiteSpace: 'pre-wrap' as const
  },
  fadeGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '20px',
    background: 'linear-gradient(to bottom, rgba(21,24,14,0), rgba(21,24,14,0.7) 55%, #15180e)',
    pointerEvents: 'none' as const
  },
  footer: {
    display: 'flex' as const,
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #212814',
    overflow: 'hidden',
    alignItems: 'center'
  }
}
