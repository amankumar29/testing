import image1 from "Assets/Images/loginSlide1.svg";
import image2 from "Assets/Images/loginSlide2.svg";
import image3 from "Assets/Images/loginSlide3.svg";
import image4 from "Assets/Images/loginSlide4.svg";
import image5 from "Assets/Images/loginSlide5.svg";
import image6 from "Assets/Images/loginSlide6.svg";
import AliceCarousel from "react-alice-carousel";

const LoginCarousel = () => {
  const data = [
    {
      id: 1,
      image: image1,
      label:
        "Low-code interface for effortless automation, enhancing testing efficiency",
    },
    {
      id: 2,
      image: image2,
      label:
        "Boost productivity with parallel execution and accelerate testing cycles ",
    },
    {
      id: 3,
      image: image3,
      label:
        "Drive informed decisions with comprehensive reports offering detailed analytics",
    },
    {
      id: 4,
      image: image4,
      label:
        "Bid farewell to unreliable execution with built-in retry mechanism",
    },
    {
      id: 5,
      image: image5,
      label:
        "Seamlessly integrate tests into CI/CD pipelines for continuous deployment and feedback",
    },
    {
      id: 6,
      image: image6,
      label:
        "Accelerate time-to-market by streamlining automation, ensuring swift releases",
    },
  ];

  const responsive = {
    1024: {
      items: 1,
      itemsFit: "contain",
    },
  };

  return (
    <div className="mt-10 pointer-events-none">
      <AliceCarousel
        autoPlay={true}
        autoPlayInterval={1050}
        animationDuration={1000}
        infinite={true}
        mouseTracking
        disableButtonsControls={true}
        // disableDotsControls={true}
        responsive={responsive}
      >
        {data?.map((item) => {
          return (
            <div key={item.id} className="h-full">
              <div className="flex items-center justify-center overflow-hidden">
                <img src={item.image} alt="" data-testid={`image_Carosal`} />
              </div>
              <div
                className="2xl:mt-[174px] xl:mt-[50px] px-5 text-lg leading-7 text-center text-iwhite tracking-[0.26px]"
                data-testid={`image_label`}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </AliceCarousel>
      {/* <div>
        <div className="flex items-center justify-center">
          <img src={image1} alt="" />
        </div>
        <div className="mt-[74px] text-lg leading-7 text-center text-ilwhite tracking-[0.26px]">
          "Low-code interface for effortless automation, enhancing testing
          efficiency"
        </div>
      </div> */}
    </div>
  );
};

export default LoginCarousel;
