const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4`}
        style={{ borderColor: 'rgba(0,198,224,0.2)', borderTopColor: '#00C6E0' }}
      />
      {text && <p className="mt-3 text-sm" style={{ color: '#8896A8' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
