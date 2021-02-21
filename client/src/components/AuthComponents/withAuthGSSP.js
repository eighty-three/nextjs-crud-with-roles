import authCheck from '@/lib/token';

const withAuthServerSideProps = (getServerSidePropsFunc, protect) => {
  return async (ctx) => {
    const { username, role } = await authCheck(ctx);
    // if protect, prevent functions inside GSSP from running if no username
    // is there ever a reason NOT to use this?
    if (protect ? (getServerSidePropsFunc && username) : getServerSidePropsFunc) {
      return {
        props:
          {
            username,
            role,
            data: await getServerSidePropsFunc({ ctx, username, role })
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
