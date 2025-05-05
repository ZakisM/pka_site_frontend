import {type ButtonStyleProps, buttonStyles} from './Button';
import {type LinkComponent, createLink} from '@tanstack/react-router';
import type {DataComponentProps} from '@/types';

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
