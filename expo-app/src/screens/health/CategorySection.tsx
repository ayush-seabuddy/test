// components/Cards/CategorySection.tsx
import ShowContentCard from "@/src/components/ShowContentCard";
import { RootState } from "@/src/redux/store";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";

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
    const {contentList, categoryList} = useSelector((state: RootState) => state.content)
  return (
    <>
      {categoryList?.map((item) => {
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
                {subtitle && <Text style={styles.categorySub}>{subtitle}</Text>}
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
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
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
  },
  scrollView: {
    marginTop: 10,
  },
  scrollContent: {
    paddingLeft: 16,
  },
});

export default CategorySection;