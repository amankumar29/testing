import LoginCarousel from "./LoginCarousel/LoginCarousel";
import LoginForm from "./LoginForm/LoginForm";
import styles from "./Login.module.scss";

const Login = () => {
  return (
    <div
      className={`h-screen flex flex-col justify-center px-[30px] lg:px-[142px] bg-gradient-to-b from-ibl16 to-ibl22 `}
    >
      <div
        className={`flex gap-[50px] h-full ${styles.custom_height} items-center justify-around`}
      >
        <div className="w-1/2 hidden md:block">
          <LoginCarousel />
        </div>
        <div className="w-full md:w-1/2 max-w-2xl h-auto sm:h-full flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
