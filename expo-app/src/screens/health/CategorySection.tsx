// components/Cards/CategorySection.tsx
import { getallcontents } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import ShowContentCard from "@/src/components/ShowContentCard";
import { listAllCategory, setContentsLoading, updateContentList } from "@/src/redux/ContentSlice";
import { AppDispatch, RootState } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { height } = Dimensions.get("window");
const isProMax = height >= 926;

interface ContentItem {
  allContents?: any[];
  [key: string]: any;
}

interface Category {
  id: string;
  Name: string;
}

interface CategorySectionProps {
  onCategoryPress: (category: Category) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  onCategoryPress,
}) => {
  const { contentList, categoryList , loading: contentLoading  } = useSelector((state: RootState) => state.content)

  const dispatch = useDispatch<AppDispatch>();
    // Fetch all contents by category
    useEffect(() => {
      const loadCategoriesAndContents = async () => {
        try {
          dispatch(setContentsLoading(true));
          const categoryList = await dispatch(listAllCategory()).unwrap();
          if (categoryList.length === 0) {
            dispatch(setContentsLoading(false));
            return;
          }
          await Promise.all(
            categoryList.map(async (item: { id: any }) => {
              try {
                const response = await getallcontents({ subCategory: item.id });
                if (response?.data) {
                  dispatch(updateContentList({ data: response.data, id: item.id }));
                }
              } catch (err) {
                console.error(`Failed to load contents for category ${item.id}:`, err);
              }
            })
          );
          dispatch(setContentsLoading(false));
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      };
      loadCategoriesAndContents();
    }, [dispatch]);
  return (
    <>
      {contentLoading ?
      <View style={{marginVertical: 20}}>
        <CommonLoader fullScreen/>
      </View> 
      :
      categoryList?.map((item) => {
        const contents = contentList?.[item.id]?.allContents || contentList?.[item.id] || [];
        if (!contents.length) return null;
        const [mainTitle, subtitle] = item.Name.includes("(")
          ? [item.Name.split("(")[0].trim(), item.Name.split("(")[1]?.split(")")[0]]
          : [item.Name, null];

        return (
          <View key={item.id} style={styles.sectionContainer}>

            <View style={styles.header}>
              <View>
                <Text style={styles.categoryTitle}>{mainTitle}</Text>
                {item.description && (
                  <Text style={styles.categorySub}>{item.description}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => onCategoryPress(item)}>
                <ChevronRight size={20} color="#404040" />
              </TouchableOpacity>
            </View>
            <ShowContentCard
              keyId={item.id}
              data={contentList[item.id] || {}}
            />

          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: 15,
  },
  categoryTitle: {
    fontSize: isProMax ? 16 : 15,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#404040",

  },
  categorySub: {
    fontSize: isProMax ? 13 : 12,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#404040",
    marginBottom: 10
  },
  scrollView: {
    marginTop: 10,
  },
  scrollContent: {
    paddingLeft: 16,
  },
});

export default CategorySection;