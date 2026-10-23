export interface CustomButtonProps {
  type?: "button" | "submit" | "reset"
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onclick?: () => void;
  children?: React.ReactNode;
  className?: string
}