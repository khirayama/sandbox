import { branch, renderComponent, withProps, compose } from 'recompose';

import { NotFound } from 'client/components/NotFound';
import { InternalServerError } from 'client/components/InternalServerError';

export interface ErrorProps {
  error: Error | null;
}

type BaseProps = ErrorProps & { statusCode: number };

// more verification required
function formatErrorCode(err: Error): number {
  return Number(err.message);
}

export const PageComponentWithError = <Props extends ErrorProps>() =>
  compose<Props, Props>(
    withProps((props: Props) => ({
      statusCode: (props.error && formatErrorCode(props.error)) || null
    })),
    branch<BaseProps>(
      (props: any) => props.statusCode === 401 || props.statusCode === 403 || props.statusCode === 404,
      renderComponent(NotFound)
    ),
    // otherwise
    branch<BaseProps>(
      (props: any) => !!props.statusCode && props.statusCode === 500,
      renderComponent(InternalServerError)
    )
  );
