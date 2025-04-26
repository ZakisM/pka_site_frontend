import {createLink, type LinkComponent} from '@tanstack/react-router';
import type {DataComponentProps} from '@/types';
import {type ButtonStyleProps, buttonStyles} from './Button';

interface BasicLinkComponentProps
  extends DataComponentProps<'a'>,
    ButtonStyleProps {}

const BasicLinkComponent = ({
  intent,
  className,
  ...rest
}: BasicLinkComponentProps) => {
  return <a {...rest} className={buttonStyles({intent, className})} />;
};

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const LinkButton: LinkComponent<typeof BasicLinkComponent> = ({
  ...rest
}) => {
  return <CreatedLinkComponent {...rest} />;
};
