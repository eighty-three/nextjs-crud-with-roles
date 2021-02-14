import { authCheck } from '@/lib/authCheck';

const withAuthServerSideProps = (getServerSidePropsFunc) => {
  return async (ctx) => {
    const { username, role } = authCheck(ctx);
    if (getServerSidePropsFunc) {
      return {
        props:
          {
            username,
            role,
            data: await getServerSidePropsFunc(ctx, username, role)
          }
      };
    }

    return {
      props:
        {
          username,
          role,
          data:
            {
              props:
                {
                  username,
                  role
                }
            }
        }
    };
  };
};

export default withAuthServerSideProps;